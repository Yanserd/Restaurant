(function (root) {
  'use strict';

  const CURRENCIES = new Set(['USD', 'EUR']);
  const API_URL = 'https://bcv.today/api/v1/rate.json';

  function validRate(value) {
    const rate = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('La tasa no es válida.');
    return rate;
  }

  function fromApi(payload, currency = 'USD') {
    if (!CURRENCIES.has(currency)) throw new Error('Moneda BCV no compatible.');
    if (!payload || typeof payload !== 'object') throw new Error('Respuesta de tasa no válida.');
    return {
      currency,
      rate: validRate(payload[currency]),
      effectiveDate: String(payload.effective_date || payload.date || ''),
      updatedAt: String(payload.updated_at || ''),
      source: 'api'
    };
  }

  function resolve(config = {}, payload) {
    const currency = CURRENCIES.has(config.currency) ? config.currency : 'USD';
    if (config.mode === 'manual') {
      return {
        currency,
        rate: validRate(config.manualRate),
        effectiveDate: String(config.manualDate || ''),
        updatedAt: '',
        source: 'manual'
      };
    }
    return fromApi(payload, currency);
  }

  function format(value, locale = 'es-VE') {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(validRate(value));
  }

  function formatDate(value, locale = 'es-VE') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return '';
    const [, year, month, day] = match;
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(Date.UTC(+year, +month - 1, +day)));
  }

  const api = { API_URL, fromApi, resolve, format, formatDate };
  root.M1529Rate = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
