import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';

/** Copy-to-clipboard with a "Copied" label for the button. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text).catch(() => {});
    setCopied(true);
  };
  return { copied, copy };
}
