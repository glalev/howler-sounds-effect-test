import Handlebars from 'hbsfy/runtime';

const helpers = () => {
  // todo handle the name better
  Handlebars.registerHelper('getInput', (options) => {
    if (options.type === 'range') return _buildRange(options);
    if (options.type === 'radio') return _buildRadio(options);
  });
}

const _buildRange = ({name, min, max, step, value, label}) => {
  const str = `
  <span class="label">${label || name}</span>
  <input class="effect-input" type="range" name="${name}" min="${min}" max="${max}" step="${step}" value="${value}" />
  <span class="${name} effect-label">${value}</span>
  <br>
  `;

  return new Handlebars.SafeString(str);
}

const _buildRadio = ({name, values}) => {
  const str = values.reduce((acc, value, i) => {
    return acc + `<input class="effect-input" ${i === 0 ? 'checked' : ''} type="radio" name="${name}" value="${value}"><span class="value">${value}</span>`
  }, '');

  return new Handlebars.SafeString(str);
};

export default helpers;