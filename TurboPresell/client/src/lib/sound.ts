import { fetchSettings } from "./api";

export async function playClickSound() {
  const settings = await fetchSettings();
  if (!settings) return;
  
  if (!settings.soundNotifications) {
    console.log("Sons desabilitados nas configurações");
    return;
  }

  try {
    const audio = new Audio(`/sounds/${settings.clickSoundFile}`);
    audio.volume = 0.3;
    // console.log(`Reproduzindo som: ${settings.clickSoundFile}`);
    // console.log("Card será destacado por 3 segundos...");
    audio.play().catch((error) => {
      console.warn("Não foi possível reproduzir som de clique:", error);
    });
  } catch (error) {
    console.warn("Erro ao criar áudio para clique:", error);
  }
}

export function playSoundPreview(filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(`/sounds/${filename}`);
      audio.volume = 0.5;
      
      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);
      
      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}