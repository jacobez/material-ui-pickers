import { ParsableDate } from '../constants/prop-types';
import { MaterialUiPickersDate } from '../typings/date';
import { DateInputProps } from '../_shared/PureDateInput';
import { MuiPickersAdapter } from '../_shared/hooks/useUtils';

export function getTextFieldAriaText(rawValue: ParsableDate, utils: MuiPickersAdapter) {
  return rawValue && utils.isValid(utils.date(rawValue))
    ? `Choose date, selected date is ${utils.format(utils.date(rawValue), 'fullDate')}`
    : 'Choose date';
}

export const getDisplayDate = (
  value: ParsableDate,
  utils: MuiPickersAdapter,
  { inputFormat, emptyInputText }: Pick<DateInputProps, 'inputFormat' | 'emptyInputText'>
) => {
  const date = utils.date(value);
  const isEmpty = value === null;

  if (isEmpty) {
    return emptyInputText || '';
  }

  return utils.isValid(date) ? utils.formatByString(date, inputFormat) : '';
};

export interface BaseValidationProps {
  /**
   * Message, appearing when date cannot be parsed
   * @default 'Invalid Date Format'
   */
  invalidDateMessage?: React.ReactNode;
}

export interface DateValidationProps extends BaseValidationProps {
  /**
   * Error message, shown if date is less then minimal date
   * @default 'Date should not be before minimal date'
   */
  minDateMessage?: React.ReactNode;
  /**
   * Error message, shown if date is more then maximal date
   * @default 'Date should not be after maximal date'
   */
  maxDateMessage?: React.ReactNode;
  /**
   * Compare dates by the exact timestamp, instead of start/end of date
   * @default false
   */
  strictCompareDates?: boolean;
}

const getComparisonMaxDate = (
  utils: MuiPickersAdapter,
  strictCompareDates: boolean,
  date: MaterialUiPickersDate
) => {
  if (strictCompareDates) {
    return date;
  }

  return utils.endOfDay(date);
};

const getComparisonMinDate = (
  utils: MuiPickersAdapter,
  strictCompareDates: boolean,
  date: MaterialUiPickersDate
) => {
  if (strictCompareDates) {
    return date;
  }

  return utils.startOfDay(date);
};

export const validateDateValue = (
  value: ParsableDate,
  utils: MuiPickersAdapter,
  {
    maxDate,
    minDate,
    disablePast,
    disableFuture,
    maxDateMessage,
    minDateMessage,
    invalidDateMessage,
    strictCompareDates,
  }: any // TODO change the typings when doing hard update of validation system
): React.ReactNode => {
  const parsedValue = utils.date(value);

  // if null - do not show error
  if (value === null) {
    return undefined;
  }

  if (!utils.isValid(value)) {
    return invalidDateMessage;
  }

  if (
    maxDate &&
    utils.isAfter(
      parsedValue,
      getComparisonMaxDate(utils, !!strictCompareDates, utils.date(maxDate))
    )
  ) {
    return maxDateMessage;
  }

  if (
    disableFuture &&
    utils.isAfter(parsedValue, getComparisonMaxDate(utils, !!strictCompareDates, utils.date()))
  ) {
    return maxDateMessage;
  }

  if (
    minDate &&
    utils.isBefore(
      parsedValue,
      getComparisonMinDate(utils, !!strictCompareDates, utils.date(minDate))
    )
  ) {
    return minDateMessage;
  }
  if (
    disablePast &&
    utils.isBefore(parsedValue, getComparisonMinDate(utils, !!strictCompareDates, utils.date()))
  ) {
    return minDateMessage;
  }

  return undefined;
};

export function pick12hOr24hFormat(
  userFormat: string | undefined,
  ampm: boolean | undefined,
  formats: { localized: string; '12h': string; '24h': string }
) {
  if (userFormat) {
    return userFormat;
  }

  if (typeof ampm === 'undefined') {
    return formats.localized;
  }

  return ampm ? formats['12h'] : formats['24h'];
}

export const staticDateWith2DigitTokens = new Date('2019-11-21T22:30:00.000');
export const staticDateWith1DigitTokens = new Date('2019-01-01T09:00:00.000');
export function checkMaskIsValidForCurrentFormat(
  mask: string,
  maskChar: string,
  format: string,
  acceptRegex: RegExp,
  utils: MuiPickersAdapter
) {
  const formattedDateWith1Digit = utils.formatByString(
    utils.date(staticDateWith1DigitTokens),
    format
  );
  const inferredFormatPatternWith1Digits = formattedDateWith1Digit.replace(acceptRegex, maskChar);

  const inferredFormatPatternWith2Digits = utils
    .formatByString(utils.date(staticDateWith2DigitTokens), format)
    .replace(acceptRegex, '_');

  const isMaskValid =
    inferredFormatPatternWith2Digits === mask && inferredFormatPatternWith1Digits === mask;

  // @ts-ignore
  if (!isMaskValid && process.env.NODE_ENV !== 'production') {
    console.warn(
      `The mask "${mask}" you passed is not valid for the format used ${format}. Falling down to uncontrolled not-masked input.`
    );
  }

  return { isMaskValid, placeholder: formattedDateWith1Digit };
}

export const maskedDateFormatter = (mask: string, numberMaskChar: string, accept: RegExp) => (
  value: string
) => {
  let result = '';
  const parsed = value.match(accept) || [];

  if (parsed.length === 0) {
    return '';
  }

  let i = 0;
  let n = 0;
  while (i < mask.length) {
    const maskChar = mask[i];
    if (maskChar === numberMaskChar && n < parsed.length) {
      const parsedChar = parsed[n];
      result += parsedChar;
      n += 1;
    } else {
      result += maskChar;
    }
    i += 1;
  }

  return result;
};
