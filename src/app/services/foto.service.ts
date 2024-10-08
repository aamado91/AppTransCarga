import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Foto } from '../interfaces/foto.interface';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  /// Variables
  public listaFotos: Foto[] = [];
  private DB_FOTOS: string = 'fotos';
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  /**
   * Tomar una foto usando la api de @capacitor/camera.
   */
  public async tomarFoto() {
    const foto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    /// Guardar la foto en el sistema de archivos y agregarla a la lista.
    const fotoGuardada = await this.guardarFoto(foto);
    this.listaFotos.unshift(fotoGuardada);

    /// Almacenar la lista de las fotos, para que se puedan cargar cuando se abre la aplicación.
    Preferences.set({
      key: this.DB_FOTOS,
      value: JSON.stringify(this.listaFotos),
    });
  }

  /**
   * Guardar foto en el sistema de archivos del dispositivo
   * @param foto Foto para guardar.
   * @returns Información de la foto almacenada.
   */
  private async guardarFoto(foto: Photo) {

    // El API de sistema de archivos requiere que la foto esta en base64.
    const base64Data = await this.convertirEnBase64(foto);

    // Escribir el archivo.
    const nombreArchivo = Date.now() + '.jpeg';
    const archivoGuardado = await Filesystem.writeFile({
      path: nombreArchivo,
      data: base64Data,
      directory: Directory.Data
    });

    // Si es una plataforma hidrida.
    if (this.platform.is('hybrid')) {
      return {
        rutaFoto: archivoGuardado.uri,
        rutaWebView: Capacitor.convertFileSrc(archivoGuardado.uri),
      };
    }
    else {
      // Retornar información de la foto.
      return {
        rutaFoto: nombreArchivo,
        rutaWebView: foto.webPath
      };
    }
  }

  /**
   * Recuperar la lista de fotos.
   */
  public async cargarFotos() {

    const { value } = await Preferences.get({ key: this.DB_FOTOS });
    this.listaFotos = (value ? JSON.parse(value) : []) as Foto[];

    // Si NO es una plataforma hidrida.
    if (!this.platform.is('hybrid')) {
      // Mostar la fotos en base64.
      for (let foto of this.listaFotos) {
        // Leer cada foto del sistema de archivos.
        const readFile = await Filesystem.readFile({
          path: foto.rutaFoto,
          directory: Directory.Data
        });

        // Para la plataforma web se carga la foto en base64.
        foto.rutaWebView = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  /**
   * Convertir foto en base 64.
   * @param foto para convertir.
   * @returns Foto en base 64.
   */
  private async convertirEnBase64(photo: Photo) {

    // Si es una plataforma hidrida.
    if (this.platform.is('hybrid')) {
      // Leer archivo en base64
      const file = await Filesystem.readFile({
        path: photo.path!
      });

      return file.data;
    }
    else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertirBlobToBase64(blob) as string;
    }
  }

  /**
   * Convertor blob en base 64.
   * @param blob Objeto de tipo blob.
   * @returns Promise de conversión base 64.
   */
  private convertirBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

}