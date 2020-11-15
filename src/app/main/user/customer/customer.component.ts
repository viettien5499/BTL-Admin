import { MustMatch } from '../../../helpers/must-match.validator';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { FormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '../../../lib/base-component';
import 'rxjs/add/operator/takeUntil';
declare var $: any;

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent extends BaseComponent implements OnInit {
  public items: any;
  public item: any;
  public totalRecords: any;
  public pageSize = 3;
  public page = 1;
  public uploadedFiles: any[] = [];
  public formsearch: any;
  public formdata: any;
  public doneSetupForm: any;
  public showUpdateModal: any;
  public isCreate: any;
  submitted = false;
  @ViewChild(FileUpload, { static: false }) file_image: FileUpload;
  constructor(private fb: FormBuilder, injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.formsearch = this.fb.group({
      'Hoten': [''],
    });
    this.search();
  }

  loadPage(page) {
    //debugger;
    this._api.post('/api/khachhang/search', { page: page, pageSize: this.pageSize }).takeUntil(this.unsubscribe).subscribe(res => {
      this.items = res.data;
      this.totalRecords = res.totalItems;
      this.pageSize = res.pageSize;
    });
  }

  search() {
    // debugger;
    this.page = 1;
    this.pageSize = 5;
    this._api.post('/api/khachhang/search', { page: this.page, pageSize: this.pageSize, Hoten: this.formsearch.get('Hoten').value }).takeUntil(this.unsubscribe).subscribe(res => {
      this.items = res.data;
      this.totalRecords = res.totalItems;
      this.pageSize = res.pageSize;
    });
  }

  pwdCheckValidator(control) {
    var filteredStrings = { search: control.value, select: '@#!$%&*' }
    var result = (filteredStrings.select.match(new RegExp('[' + filteredStrings.search + ']', 'g')) || []).join('');
    if (control.value.length < 6 || !result) {
      return { matkhau: true };
    }
  }

  get f() { return this.formdata.controls; }

  onSubmit(value) {
    this.submitted = true;
    if (this.formdata.invalid) {
      return;
    }
    if (this.isCreate) {
      this.getEncodeFromImage(this.file_image).subscribe((data: any): void => {
        let data_image = data == '' ? null : data;
        let tmp = {
          Hoten: value.Hoten,
          Gioitinh: value.Gioitinh,
          Email: value.Email,
          SDT: value.SDT,
          Diachi: value.Diachi,
          Password: value.Password,
        };
        this._api.post('/api/khachhang/create-kh', tmp).takeUntil(this.unsubscribe).subscribe(res => {
          alert('Thêm thành công');
          this.search();
          this.closeModal();
        });
      });
    } else {
      this.getEncodeFromImage(this.file_image).subscribe((data: any): void => {
        let data_image = data == '' ? null : data;
        let tmp = {
          Hoten: value.Hoten,
          Gioitinh: value.Gioitinh,
          Email: value.Email,
          SDT: value.SDT,
          Diachi: value.Diachi,
          Password: value.Password,
          Makh: this.item.Makh,
        };
        this._api.post('/api/khachhang/update-kh', tmp).takeUntil(this.unsubscribe).subscribe(res => {
          alert('Cập nhật thành công');
          this.search();
          this.closeModal();
        });
      });
    }
  }

  onDelete(row) {
    this._api.post('/api/khachhang/delete-kh',{Makh:row.Makh}).takeUntil(this.unsubscribe).subscribe(res => {
      alert('Xóa thành công');
      this.search();
    });
  }

  Reset() {
    this.item = null;
    this.formdata = this.fb.group({
      'Hoten': ['', Validators.required],
      'Gioitinh': ['', Validators.required],
      'Email': ['', Validators.required],
      'SDT': ['', Validators.required],
      'Diachi': ['', Validators.required],
      'Password': ['', Validators.required],
      'nhaplaimatkhau': ['', Validators.required],
    }, {
      validator: MustMatch('Password', 'nhaplaimatkhau')
    });
  }

  createModal() {
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    this.isCreate = true;
    this.item = null;
    setTimeout(() => {
      $('#createItemModal').modal('toggle');
      this.formdata = this.fb.group({
        'Hoten': ['', Validators.required],
        'Gioitinh': ['', Validators.required],
        'Email': ['', Validators.required],
        'SDT': ['', Validators.required],
        'Diachi': ['', Validators.required],
        'Password': ['', Validators.required],
        'nhaplaimatkhau': ['', Validators.required],
      }, {
        validator: MustMatch('Password', 'nhaplaimatkhau')
      });
      this.doneSetupForm = true;
    });
  }

  public openUpdateModal(row) {
  
    this.doneSetupForm = false;
    this.showUpdateModal = true;
    this.isCreate = false;
    setTimeout(() => {
      $('#createItemModal').modal('toggle');
      this._api.get('/api/khachhang/get-by-id/' + row.makh).takeUntil(this.unsubscribe).subscribe((res: any) => {
        this.item = res;
        this.formdata = this.fb.group({
          'Makh':[row.makh],
          'Hoten': [this.item.hoten, Validators.required],
          'Gioitinh': [this.item.gioitinh],
          'Email': [this.item.email, Validators.required],
          'SDT': [this.item.sdt],
          'Diachi': [this.item.diachi],
          'Password': [this.item.password],
          'nhaplaimatkhau': [this.item.password, Validators.required],
        }, {
          validator: MustMatch('Password', 'nhaplaimatkhau')
        });
        this.doneSetupForm = true;
      });
    }, 700);
  }

  closeModal() {
    $('#createItemModal').closest('.modal').modal('hide');
  }
}