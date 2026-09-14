import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase/supabase-client';
import { AppDocument } from '../models/document.model';

const BUCKET = 'documents';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  readonly documents = signal<AppDocument[]>([]);

  constructor() {
    this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load documents:', error.message);
      return;
    }
    this.documents.set((data ?? []).map(this.fromRow));
  }

  getById(id: string): AppDocument | undefined {
    return this.documents().find(d => d.id === id);
  }

  /** Uploads the file to Supabase Storage and returns its storage path. */
  async uploadFile(file: File): Promise<string | null> {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) {
      console.error('Failed to upload file:', error.message);
      return null;
    }
    return path;
  }

  async create(doc: Omit<AppDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppDocument | null> {
    const { data, error } = await supabase.from('documents').insert(this.toRow(doc)).select().single();
    if (error) {
      console.error('Failed to create document:', error.message);
      return null;
    }
    await this.refresh();
    return this.fromRow(data);
  }

  async update(id: string, changes: Partial<AppDocument>): Promise<void> {
    const { error } = await supabase.from('documents').update(this.toRow(changes)).eq('id', id);
    if (error) {
      console.error('Failed to update document:', error.message);
      return;
    }
    await this.refresh();
  }

  async delete(id: string): Promise<void> {
    const doc = this.getById(id);
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete document:', error.message);
      return;
    }
    if (doc?.filePath) {
      await supabase.storage.from(BUCKET).remove([doc.filePath]);
    }
    await this.refresh();
  }

  private toRow(d: Partial<AppDocument>): Record<string, any> {
    const row: Record<string, any> = {};
    if (d.documentName !== undefined) row['document_name'] = d.documentName;
    if (d.documentType !== undefined) row['document_type'] = d.documentType;
    if (d.documentSubType !== undefined) row['document_sub_type'] = d.documentSubType;
    if (d.documentNumber !== undefined) row['document_number'] = d.documentNumber;
    if (d.documentDate !== undefined) row['document_date'] = d.documentDate || null;
    if (d.documentDescription !== undefined) row['document_description'] = d.documentDescription;
    if (d.documentStatus !== undefined) row['document_status'] = d.documentStatus;
    if (d.fileName !== undefined) row['file_name'] = d.fileName;
    if ((d as any).filePath !== undefined) row['file_path'] = (d as any).filePath;
    if (d.fileSizeBytes !== undefined) row['file_size_bytes'] = d.fileSizeBytes;
    return row;
  }

  private fromRow(row: any): AppDocument & { filePath?: string } {
    return {
      id: row.id,
      documentName: row.document_name,
      documentType: row.document_type,
      documentSubType: row.document_sub_type,
      documentNumber: row.document_number ?? undefined,
      documentDate: row.document_date ?? undefined,
      documentDescription: row.document_description ?? undefined,
      documentStatus: row.document_status,
      fileName: row.file_name,
      filePath: row.file_path ?? undefined,
      fileSizeBytes: row.file_size_bytes ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
