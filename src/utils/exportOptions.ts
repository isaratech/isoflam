import domtoimage from 'dom-to-image';
import FileSaver from 'file-saver';
import {Model, Size} from '../types';
import {compress} from './compression';

export const generateGenericFilename = (extension: string) => {
  return `isoflam-export-${new Date().toISOString()}.${extension}`;
};

export const base64ToBlob = (
  base64: string,
  contentType: string,
  sliceSize = 512
) => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });

  return blob;
};

export const downloadFile = (data: Blob, filename: string) => {
  FileSaver.saveAs(data, filename);
};

export const exportAsJSON = (model: Model) => {
    // Create a copy of the model without icons and colors
    const {icons, colors, ...modelWithoutIconsAndColors} = model;

    const data = new Blob([JSON.stringify(modelWithoutIconsAndColors)], {
    type: 'application/json;charset=utf-8'
  });

  downloadFile(data, generateGenericFilename('json'));
};

export const exportAsImage = async (el: HTMLDivElement, size?: Size) => {
  const imageData = await domtoimage.toPng(el, {
    ...size,
    cacheBust: true
  });

  return imageData;
};

// promptMessage is shown with the text when it can't be copied automatically
export const copyToClipboard = (text: string, promptMessage: string) => {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers or non-secure contexts
        return new Promise<void>((resolve, reject) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    resolve();
                } else {
                    // If execCommand fails (e.g. because of async context), fallback to prompt
                    window.prompt(promptMessage, text);
                    resolve();
                }
            } catch (err) {
                document.body.removeChild(textArea);
                window.prompt(promptMessage, text);
                resolve();
            }
        });
    }
};

export const exportAsUrl = async (model: Model) => {
    // Create a copy of the model without icons and colors
    const {icons, colors, ...modelWithoutIconsAndColors} = model;
    const jsonString = JSON.stringify(modelWithoutIconsAndColors);

    try {
        const compressed = await compress(jsonString);
        const url = `${window.location.origin}${window.location.pathname}#${compressed}`;

        // Browser limit safe guard (approx 30k for most browsers, though some support more)
        // Warning the user as requested
        const limit = 30000;
        if (url.length > limit) {
            throw new Error("SCENE_TOO_LARGE");
        }

        return url;
    } catch (error) {
        throw error;
    }
};
