import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FirebaseConfig } from './config-firebase';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { PipesModule } from './pipes.module';
import { Camera } from '@ionic-native/camera/ngx';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { File } from '@ionic-native/file/ngx';
import { Printer } from '@ionic-native/printer/ngx';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { DetalleProductoPageModule } from './detalle-producto/detalle-producto.module';
import { DatePickerModule } from 'ionic4-date-picker';
import { CalendarioPageModule } from './calendario/calendario.module';
import localeEsCO from '@angular/common/locales/es-CO';
import { registerLocaleData } from '@angular/common';
import { DetalleGrupoPageModule } from './detalle-grupo/detalle-grupo.module';
import { DetalleReporteVentaPageModule } from './detalle-reporte-venta/detalle-reporte-venta.module';

registerLocaleData(localeEsCO);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(FirebaseConfig),
    AngularFirestoreModule.enablePersistence(),
    AngularFireStorageModule,
    CalendarioPageModule,
    DatePickerModule,
    DetalleGrupoPageModule,
    DetalleProductoPageModule,
    DetalleReporteVentaPageModule,
    PipesModule
  ],
  providers: [
    Camera,
    File,
    Printer,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-CO' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
