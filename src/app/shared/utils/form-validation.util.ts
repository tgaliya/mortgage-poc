import { FormGroup } from '@angular/forms';

const GENERIC_MESSAGE = 'Please fill all the required fields!';

/**
 * After a failed submit, returns the toast messages to show: the generic
 * "fill required fields" message if any field is simply empty, plus one
 * deduped specific message per field whose error is more than plain
 * "required" (e.g. a format validator like phone/zip/ssn/amount/date).
 */
export function getValidationToastMessages(form: FormGroup, fieldMessages: Record<string, string>): string[] {
  const specific: string[] = [];
  let hasPlainRequiredMissing = false;

  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    if (!control || control.valid || control.disabled) {
      return;
    }

    const errorKeys = Object.keys(control.errors ?? {});
    const onlyRequired = errorKeys.length === 1 && errorKeys[0] === 'required';

    if (onlyRequired) {
      hasPlainRequiredMissing = true;
    } else if (fieldMessages[key] && !specific.includes(fieldMessages[key])) {
      specific.push(fieldMessages[key]);
    }
  });

  const messages = hasPlainRequiredMissing ? [GENERIC_MESSAGE, ...specific] : specific;
  return messages.length > 0 ? messages : [GENERIC_MESSAGE];
}
