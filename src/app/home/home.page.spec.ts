import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows one button per plugin action', () => {
    const labels = [...fixture.nativeElement.querySelectorAll('ion-button')].map((button: HTMLElement) =>
      button.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(labels).toEqual([
      'Check permissions',
      'Request permissions',
      'Schedule now',
      'Schedule in 15 seconds',
      'Schedule in 90 seconds, then every 90 seconds',
      'Schedule every minute',
      'Get pending',
      'Cancel all',
      'Remove all delivered',
    ]);
  });
});
