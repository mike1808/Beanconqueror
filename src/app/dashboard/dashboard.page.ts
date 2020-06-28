import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UIStatistic} from '../../services/uiStatistic';
import {BrewAddComponent} from '../brew/brew-add/brew-add.component';
import {ModalController} from '@ionic/angular';
import {Brew} from '../../classes/brew/brew';
import {UIBrewStorage} from '../../services/uiBrewStorage';
import {UIBrewHelper} from '../../services/uiBrewHelper';
import {BrewDetailComponent} from '../brew/brew-detail/brew-detail.component';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  public brews: Array<Brew> = [];

  constructor(public uiStatistic: UIStatistic,
              private readonly modalCtrl: ModalController,
              private readonly uiBrewStorage: UIBrewStorage,
              private readonly uiBrewHelper: UIBrewHelper,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
  }

  public ionViewWillEnter(): void {
    this.__loadBrews();
  }

  public async addBrew() {
    if (this.uiBrewHelper.canBrewIfNotShowMessage()) {
      const modal = await this.modalCtrl.create({component: BrewAddComponent});
      await modal.present();
      await modal.onWillDismiss();
      this.__loadBrews();
    }
  }

  public getBrews() {
    this.brews = this.uiBrewStorage.getAllEntries();
    this.brews = this.__sortBrews(this.brews);
    this.brews = this.brews.slice(0, 10);
    return this.brews;
  }

  private __loadBrews() {
    this.brews = this.uiBrewStorage.getAllEntries();
    this.brews = this.__sortBrews(this.brews);
    this.brews = this.brews.slice(0, 10);
    console.log(this.brews);
    this.changeDetectorRef.detectChanges();
  }

  private __sortBrews(_sortingBrews: Array<Brew>): Array<Brew> {
    const sortedBrews: Array<Brew> = _sortingBrews.sort((obj1, obj2) => {
      if (obj1.config.unix_timestamp < obj2.config.unix_timestamp) {
        return 1;
      }
      if (obj1.config.unix_timestamp > obj2.config.unix_timestamp) {
        return -1;
      }

      return 0;
    });
    return sortedBrews;
  }

  public async openBrew(_brew: Brew) {
    const modal = await this.modalCtrl.create({component: BrewDetailComponent, componentProps: {brew: _brew}});
    await modal.present();
    await modal.onWillDismiss();
  }
}
