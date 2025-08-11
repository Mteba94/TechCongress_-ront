import { Component } from '@angular/core';
import { Header } from "../../../shared/components/layout/header/header";
import { Hero } from "../../homepage/hero/hero";

@Component({
  selector: 'app-layout',
  imports: [Header, Hero],
  templateUrl: './layout.html',
})
export class Layout {

}
