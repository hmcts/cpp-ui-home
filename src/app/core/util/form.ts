export const parseFormValues = <T extends object>(values: T): T => {
  return Object.keys(values).reduce((valueMap, key) => {
    const value = values[key as keyof T];
    const formattedValue = typeof value === 'string' ? value.trim() : value;

    if (formattedValue) {
      return {
        ...valueMap,
        [key]: formattedValue,
      };
    }
    return valueMap;
  }, {} as T);
};
