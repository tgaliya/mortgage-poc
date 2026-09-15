import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentType, DOCUMENT_SUB_TYPE_MAP } from '../../../core/models/document.model';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../../shared/directives/enter-submit.directive';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { getValidationToastMessages } from '../../../shared/utils/form-validation.util';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_FILE_MB = 5;

@Component({
  selector: 'app-document-details-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective, IconComponent],
  templateUrl: './document-details-form.component.html'
})
export class DocumentDetailsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  documentId = signal<string | null>(null);
  documentTypes = Object.keys(DOCUMENT_SUB_TYPE_MAP) as DocumentType[];
  subTypeOptions = signal<string[]>([]);
  selectedFile = signal<File | null>(null);
  existingFileName = signal<string | null>(null);
  fileError = signal(false);
  submitted = signal(false);

  form = this.fb.group({
    documentName: ['', [Validators.required]],
    documentType: ['', [Validators.required]],
    documentSubType: ['', [Validators.required]],
    documentNumber: [''],
    documentDate: [''],
    documentDescription: [''],
    documentStatus: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.form.controls.documentType.valueChanges.subscribe(type => {
      this.subTypeOptions.set(type ? DOCUMENT_SUB_TYPE_MAP[type as DocumentType] ?? [] : []);
      this.form.controls.documentSubType.setValue('');
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.documentId.set(id);
      const doc = this.documentService.getById(id);
      if (doc) {
        this.subTypeOptions.set(DOCUMENT_SUB_TYPE_MAP[doc.documentType] ?? []);
        this.form.patchValue(doc as any);
        this.existingFileName.set(doc.fileName);
      }
    }
  }

  get f() {
    return this.form.controls;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      this.toast.error('Only .pdf, .jpg, .jpeg, or .png files are allowed!');
      input.value = '';
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      this.toast.error('File size exceeds the 5 MB limit!');
      input.value = '';
      return;
    }

    this.selectedFile.set(file);
    this.fileError.set(false);
    this.toast.success('Document uploaded successfully!');
  }

  clearForm(): void {
    this.form.reset();
    this.selectedFile.set(null);
    this.subTypeOptions.set([]);
    this.submitted.set(false);
    this.fileError.set(false);
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/document-upload-review/document-details']);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid) {
      getValidationToastMessages(this.form, {}).forEach(msg => this.toast.error(msg));
      return;
    }

    const fileMissing = !this.isEditMode() && !this.selectedFile();
    if (fileMissing) {
      this.fileError.set(true);
      this.toast.error('Please upload a document file!');
      return;
    }
    this.fileError.set(false);

    const v = this.form.value as any;
    const file = this.selectedFile();

    let filePath: string | undefined;
    let fileName = this.existingFileName() ?? '';
    let fileSizeBytes = 0;

    if (file) {
      const uploadedPath = await this.documentService.uploadFile(file);
      if (!uploadedPath) {
        this.toast.error('File upload failed. Please try again.');
        return;
      }
      filePath = uploadedPath;
      fileName = file.name;
      fileSizeBytes = file.size;
    }

    const payload = {
      ...v,
      fileName,
      filePath,
      fileSizeBytes
    };

    if (this.isEditMode() && this.documentId()) {
      await this.documentService.update(this.documentId()!, payload);
      this.toast.success('Document updated!');
    } else {
      await this.documentService.create(payload);
      this.toast.success('Document submitted!');
    }

    this.router.navigate(['/document-upload-review/document-details']);
  }
}
