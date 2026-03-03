/**
 * Calculate inflation rate by investment horizon.
 * Override via DataProvider for production values.
 */
const calculateInflation = (yearsHorizon: number): number => 6.0;

export default calculateInflation;
