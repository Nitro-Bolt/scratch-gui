const sanitize = (input) => {
  if (typeof input === "object") {
    return JSON.stringify(input);
  } else {
    return input;
  }
}

const sanitizeVariableType = (input, type) => {
  switch (type) {
    case "table":
      return [[1,3,5],[2,4,6],[0,0,0]]; // Test
    case "list":
      const sanitizedList = [];
      for (const item of input) {
        sanitizedList.push(sanitize(item));
      }
      return sanitizedList;
    default:
      return sanitize(input);
  }
}

module.exports = {
  sanitize,
  sanitizeVariableType
}