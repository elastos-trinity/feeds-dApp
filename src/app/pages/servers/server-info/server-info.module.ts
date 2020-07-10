import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ServerInfoPage } from './server-info';

const routes: Routes = [
  {
    path: '',
    component: ServerInfoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonicModule,
    QRCodeModule,
    RouterModule.forChild(routes)
  ],

  declarations: [
    ServerInfoPage
  ]
})

export class ServerInfoPageModule {}
