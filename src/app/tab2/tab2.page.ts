import { Component } from '@angular/core';
import { IonHeader, IonIcon, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonImg, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { FotoService } from '../services/foto.service';
import { addIcons } from 'ionicons';
import { camera } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonHeader, IonIcon, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonImg, IonFab, IonFabButton, ExploreContainerComponent]
})
export class Tab2Page {

  constructor(public fotoService: FotoService) {
    addIcons({ camera });
  }

  /// Ciclo de vida.
  async ngOnInit() {
    await this.fotoService.cargarFotos();
  }

  /**
   * Tomar una foto usando la camara del dispositivo.
   */
  tomarFoto() {
    this.fotoService.tomarFoto();
  }

}
