import { Component, OnInit } from '@angular/core';
import { DeckService } from '../../services/cards/deck.service'
import { FireService } from '../../services/cards/fire/fire.service';
import { HazeService } from '../../services/cards/fire/haze.service';
import { RoadService } from '../../services/cards/earthquake/road.service';
import { StructureService } from '../../services/cards/earthquake/structure.service';

@Component({
  selector: 'app-report-review',
  templateUrl: './report-review.component.html',
  styleUrls: ['./report-review.component.scss']
})
export class ReportReviewComponent implements OnInit {

  previewImg: HTMLImageElement

  constructor(
    public deckService: DeckService,
    public fireService: FireService,
    public hazeService: HazeService,
    public roadService: RoadService,
    public strutureService: StructureService
  ) { }

  ngOnInit() {
    this.previewImg = document.getElementById('preview-img') as HTMLImageElement
    if (this.deckService.getPreview()) {
      this.setImagePreview(this.deckService.getPreview())
    } else {
      let previewImgSrc
      switch (this.deckService.getDeckType()) {
        case 'fire': previewImgSrc = '../../../assets/decks/fire/review/Fire.png'; break;
        case 'haze': previewImgSrc = '../../../assets/decks/fire/review/Haze.png'; break;
        default: previewImgSrc = 'https://via.placeholder.com/150'; break;
      }
      this.previewImg.setAttribute('src', previewImgSrc)
    }
  }

  setImagePreview(file: File) {
    const reader = new FileReader()
    reader.onload = (e: any) => {
      this.previewImg.setAttribute('src', e.target.result)
    }
    reader.readAsDataURL(file)
  }

  get description() {
    return this.deckService.getDescription()
  }

  get deckType() {
    return this.deckService.getDeckType()
  }

  // Fire

  get fireRange() {
    const radius = this.fireService.getCircleRadius()
    const range = Math.PI * Math.pow(radius, 2) / 10000
    
    if (range < 1) return '<1'
    return range.toFixed(2)
  }

  // Haze

  get airQuality() {
    const quality = this.hazeService.getAirQuality()

    switch(quality) {
      case 0: return ''
      case 1: return 'Moderate'
      case 2: return 'Poor'
      case 3: return 'Severe'
      case 4: return 'Hazardous'
    }
  }

  get visibility() {
    const visibleValue = this.hazeService.getHazeVisibility()

    switch (visibleValue) {
      case 0: return 'High'
      case 1: return 'Moderate'
      case 2: return 'Low'
    }
  }

  // Road
  get roadAccessibility() {
    return this.roadService.getRoadAccessibility()
  }

  get roadAccessibilityHint() {
    const accessibility = this.roadService.getRoadAccessibility()

    if (accessibility <= 0.5) {
      return "No Vehicle"
    } else if (accessibility <= 1.0) {
      return "2-Wheel Vehicle"
    } else if(accessibility <= 1.4) {
      return "4-Wheel Vehicle"
    } else if (accessibility <= 1.8) {
      return "Large Vehicle"
    } else {
      return "Large Vehicle (Truck)"
    }
  }

  get roadCondition() {
    const condition = this.roadService.getRoadCondition()

    switch (condition) {
      case 0: return 'Light'
      case 1: return 'Moderate'
      case 2: return 'Heavy'
    }
  }

  // Structure
  get structuralFailure() {
    const failure = this.strutureService.getStructureFailure()

    switch(failure) {
      case 0: return 'Cracking'
      case 1: return 'Partially Collapsed'
      case 2: return 'Fully Collapsed'
    }
  }
}
