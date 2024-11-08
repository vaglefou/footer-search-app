import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatInputModule, MatCardModule, MatListModule, FormsModule],
  template: `
    <mat-card>
      <h2>Αναζήτηση Εταιρίας</h2>
      <mat-form-field appearance="fill">
        <mat-label>Αναζήτηση</mat-label>
        <input matInput [(ngModel)]="query" placeholder="Εισάγετε όρο αναζήτησης">
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="search()">Αναζήτηση</button>
    </mat-card>
    <mat-card *ngIf="results.length > 0">
      <h3>Αποτελέσματα</h3>
      <mat-list>
        <mat-list-item *ngFor="let result of results">
          <strong>{{ result.url }}:</strong> {{ result.company }}
        </mat-list-item>
      </mat-list>
    </mat-card>
  `,
  styles: [
    `
      mat-card {
        margin: 20px;
      }
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class SearchComponent {
  query = '';
  results: { url: string; company: string }[] = [];

  constructor(private http: HttpClient) {}

  search() {
    this.http.post<{ url: string; company: string }[]>('/api/search', { query: this.query })
      .subscribe((data) => {
        this.results = data;
      });
  }
}
