import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from '../../../services/navigation.service';
import { DeckService } from '../../../services/cards/deck.service';
import { environment as env } from '../../../../environments/environment';

@Component({
  selector: 'app-fire',
  templateUrl: './fire.component.html',
  styleUrls: ['./fire.component.scss']
})
export class FireComponent implements OnInit {
  items: {
    title: string;
    subType: 'real' | 'training';
  }[];
  showReportTypeButton: boolean = true
  constructor(
    public translate: TranslateService,
    public route: ActivatedRoute,
    public navController: NavigationService,
    public deckService: DeckService
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang(env.default_language);

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use(this.deckService.getCardLanguage());

    // Store card routes for navigation
    this.navController.registerCardRoutes('fire');

    // Check for first card, else redirect
    this.navController.checkForFirstCard(this.route);

    this.deckService.setDeckType('fire')
    this.deckService.setDeckSubType('fire')

    this.deckService.setRoute(route)
  }

  onTypeSelected(type) {
    this.showReportTypeButton = false;
    this.deckService.selectReportType(type);
  }

  get isShowButtons(): boolean {
    return this.showReportTypeButton;
  }

  ngOnInit() {
    this.items = [
      {
        title: 'card.type.report.realTypeButton',
        subType: 'real',
      },
      {
        title: 'card.type.report.trainingTypeButton',
        subType: 'training',
      },
    ];
  }

}
