/* eslint no-await-in-loop: 0 */
const bent = require('bent');
const debug = require('debug')('lib:Web3Rekt');
const qs = require('querystring');
const pino = require('pino');
const {
  endpoints: { web3rekt },
  getLimit,
  getBatchInterval,
  firstDate,
  rateLimitInterval,
} = require('../config');
const { sleep } = require('./utils');

class Web3Rekt {
  constructor() {
    this.get = bent(web3rekt, 'json');
    this.log = pino();
  }

  /**
   * Get all incidents between two dates
   */
  async getIncidents(opts = {}) {
    const {
      start = firstDate,
      end = Math.round(Date.now() / 1000),
      limit = getLimit,
      onData = async () => {},
    } = opts;

    const data = await this.getIncidentsBatch({ start, end, limit });
    if (data.length) {
      await onData(data);
    }
    await sleep(getBatchInterval);

    // Check whether there is more data available for the given range
    debug('check', {
      data: data.length, limit, continue: data.length === limit,
    });
    if (data.length === limit) {
      // Currently there is no consistent ordering on results so we will split
      // the time range by half and traverse each shorter range
      const half = start + Math.round((end - start) / 2);

      await this.getIncidents({
        start, end: half, limit, onData,
      });

      await this.getIncidents({
        start: half, end, limit, onData,
      });
    }
  }

  async getIncidentsBatch(opts = {}) {
    debug('getIncidentsBatch: %j', opts);
    const { start, end, limit } = opts;

    const query = qs.stringify({
      startdate: Web3Rekt.formatTime(start),
      enddate: Web3Rekt.formatTime(end),
      limit,
    });
    debug('query:', query);

    let data = null;
    do {
      try {
        data = (await this.get(`?${query}`)).map(Web3Rekt.parseIncident);
      } catch (err) {
        switch (err.statusCode) {
          case 429:
            this.log.warn(
              { err, sleepFor: rateLimitInterval },
              'RATE_LIMIT_ERROR',
            );
            await sleep(rateLimitInterval);
            break;
          case 404:
            data = [];
            break;
          default:
            throw err;
        }
      }
    } while (!data);

    return data;
  }

  static formatTime(time) {
    // incident api param date is yyyy-mm-dd
    const date = new Date(time * 1000);
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = `0${month}`;
    }
    let day = date.getDate();
    if (day < 10) {
      day = `0${day}`;
    }
    return `${date.getFullYear()}-${month}-${day}`;
  }

  static formatReportDate(str) {
    // incident.report_date format is m/d/yyyy
    const parts = str.split('/');
    const year = parts[2];
    let [month, day] = parts;
    if (month < 10) {
      month = `0${month}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }
    return `${year}-${month}-${day}`;
  }

  static parseIncident(payload) {
    // eslint-disable-next-line
    const { index, report_date, ...rest } = payload;
    return {
      date: Math.round(new Date(Web3Rekt.formatReportDate(report_date)) / 1000),
      ...rest,
    };
  }
}

module.exports = Web3Rekt;
