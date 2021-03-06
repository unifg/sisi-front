import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AclService } from 'ng2-acl';
import { OccurrenceService } from '../../services/occurrence.service';
import { Occurrence } from '../../models/occurrence.model';
import { first } from 'rxjs/operators';
import { NotifyService } from '../../services/notify/notify.service';
import { Zone } from './../../models/zone.model';

@Component({
  selector: 'app-view-occurrence',
  templateUrl: './view-occurrence.component.html',
  styleUrls: ['./view-occurrence.component.scss'],
  providers: [ OccurrenceService ]
})
export class ViewOccurrenceComponent implements OnInit {

  public occurrence: Occurrence;
  public status = { 'loading': true};
  public idOccurrence: number;
  public titleOccurrence: string;
  today = new Date().toJSON().split('T')[0];
  date = new Date();
  minDate: string;
  public zones: Zone[];

  formOccurrence: FormGroup;
  loading = false;
  submitted = false;

  // ativar edição - GAMB
  disabled = true;
  disabledSelect = false;
  nameButtom = 'Editar';

  // Validator patterns
  titlePattern = '^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ0-9,.!?*"#%(); -]{6,32}$';
  storyPattern = '^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ0-9,.!?*"#%(); -]{12,256}$';
  cpfPattern = '^[0-9]{11}$';
  namePattern = '^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]{4,52}$';

  lat  = -8.05225025;
  lng  = -34.9450490084884;
  locationChosen = true;

   // Variaveis de conversão das cordenadas do mapa
   coordString: string;
   resultado: string[];
   numberLAT;
   numberLNG;

   // GAMB
  onChoseLocation(event) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.locationChosen = true;
    this.coordString = this.lat.toFixed(5) + ',' + this.lng.toFixed(5);
  }

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private occurrenceService: OccurrenceService,
    public aclService: AclService,
    private notifier: NotifyService

    ) {}

    ngOnInit() {
      this.occurrenceService.getZones().subscribe((response: any) => this.zones = response.data);

      this.date.setFullYear(this.date.getFullYear() - 1);
      this.minDate = this.date.toJSON().split('T')[0];
      this.route.params.subscribe(
        (params: Params) => {
          this.occurrenceService.getOccurrencesID(params.id)
          .subscribe( (occurrence: any) => {
            this.occurrence = occurrence.data;
            this.idOccurrence = occurrence.data.id;
            this.titleOccurrence = occurrence.data.title;

             // separando as coordenadas
            this.coordString = occurrence.data.coordinates;
            this.resultado = this.coordString.split(',');
            this.lat = +this.resultado[0];
            this.lng = +this.resultado[1];

            this.formOccurrence = this.formBuilder.group({
              title: [occurrence.data.title, [ Validators.required, Validators.pattern(this.titlePattern)]],
              story: [occurrence.data.story, [Validators.required, Validators.pattern(this.storyPattern)]],
              occurrence_date: [occurrence.data.occurrence_date, Validators.required],
              occurrence_time: [occurrence.data.occurrence_time, Validators.required],
              coordinates: [this.coordString, Validators.required],
              police_report: [occurrence.data.police_report, Validators.required],
              estimated_loss: ['345'],
              occurrence_type_id: [occurrence.data.occurrence_type.id, Validators.required],
              zone_id: [occurrence.data.zone.id, Validators.required],
              involved_person: this.formBuilder.group({
                name: ['', Validators.pattern(this.namePattern)],
                cpf: ['', [Validators.pattern(this.cpfPattern)]],
                gender: [''],
                skin_color: [''],
                type: ['']
              }),
              occurrence_objects: this.formBuilder.group({
                object_id: [Number]
              })
            });
          });
        }
      );


    }

    noDisable2() {
     this.status = { 'loading': false};
    }

    arquivarInvestigator() {
      this.occurrenceService.statusOccurrences(this.idOccurrence, 'ARQUIVADA')
      .pipe(first())
      .subscribe(
          data => {
            this.notifier.show('success', 'Registro de ocorrência foi ARQUIVADO');
          },
          error => {
            this.notifier.show('error', 'Ocorreu um erro ao tentar alterar o status da ocorrência');
          });
    }

    validaInvestigator() {
      this.occurrenceService.statusOccurrences(this.idOccurrence, 'EM INVESTIGACAO')
      .pipe(first())
      .subscribe(
        data => {
          this.notifier.show('success', 'Registro de ocorrência está em INVESTIGACAO');
        },
        error => {
          this.notifier.show('error', 'Ocorreu um erro ao tentar alterar o status da ocorrência');
        });
    }

    onSubmit() {
      this.submitted = true;
          // stop here if form is invalid
          if (this.formOccurrence.invalid) {
            this.notifier.show('warning', 'Erro ao tentar editar uma ocorrência, confira se os campos foram preenchidos corretamente.');
            return;
          }

          this.loading = true;
          this.occurrenceService.editarOccurrences(this.formOccurrence.value, this.idOccurrence)
              .pipe(first())
              .subscribe(
                  data => {
                    this.notifier.show('success', 'Ocorrência editada com sucesso!');
                    this.router.navigate(['/list-occurrence']);
                  },
                  error => {
                    this.loading = false;
                    this.notifier.show('error', 'Ocorreu um erro ao tentar editar uma ocorrência, suas informações não foram enviadas.');
                  });
    }

  get f() { return this.formOccurrence.controls; }

  onDisable() {
    if (this.disabled) {
      // ativa
      this.disabled = false;
      this.disabledSelect = true;
      this.nameButtom = 'Cancelar';
    } else {
      // desativa
      this.disabled = true;
      this.disabledSelect = false;
      this.nameButtom = 'Editar';
    }

  }

}

