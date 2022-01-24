function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
}

const firstTrait = (nlp, name) => {
  return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
};

module.exports = { isValidDate, firstTrait };
