export async function copyShareLink(url: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return true;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is not available in this environment.');
  }

  const input = document.createElement('textarea');
  input.value = url;
  input.setAttribute('readonly', 'true');
  input.style.position = 'absolute';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  const success = document.execCommand('copy');
  document.body.removeChild(input);

  if (!success) {
    throw new Error('Failed to copy the share link.');
  }

  return true;
}
