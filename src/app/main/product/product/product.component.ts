import { MustMatch } from '../../../helpers/must-match.validator';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { FormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '../../../lib/base-component';
import 'rxjs/add/operator/takeUntil';
declare var $: any;
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent extends BaseComponent implements OnInit {
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
      'Tensp': [''],
    });
    this.search();
  }

  loadPage(page) {
    //debugger;
    this._api.post('/api/sanpham/search1', { page: page, pageSize: this.pageSize }).takeUntil(this.unsubscribe).subscribe(res => {
      this.items = res.data;
      this.totalRecords = res.totalItems;
      this.pageSize = res.pageSize;
    });
  }

  search() {
    // debugger;
    this.page = 1;
    this.pageSize = 5;
    this._api.post('/api/sanpham/search1', { page: this.page, pageSize: this.pageSize, Tensp: this.formsearch.get('Tensp').value }).takeUntil(this.unsubscribe).subscribe(res => {
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
          Tensp: value.Tensp,
          Maloai: value.Maloai,
          Mausac: value.Mausac,
          Size: value.Size,
          Chatlieu: value.Chatlieu,
          Giatien: +value.Giatien,
          Soluong: value.Soluong,
          Spmoi: value.Spmoi,
          Giakm: value.Giakm,
          Hinhanh: data_image,
          Mota: value.Mota,
        };
        this._api.post('/api/sanpham/create-item', tmp).takeUntil(this.unsubscribe).subscribe(res => {
          alert('Thêm thành công');
          this.search();
          this.closeModal();
        });
      });
    } else {
      this.getEncodeFromImage(this.file_image).subscribe((data: any): void => {
        let data_image = data == '' ? null : data;
        let tmp = {
          Tensp: value.Tensp,
          Maloai: value.Maloai,
          Mausac: value.Mausac,
          Size: value.Size,
          Chatlieu: value.Chatlieu,
          Giatien: +value.Giatien,
          Soluong: value.Soluong,
          Spmoi: value.Spmoi,
          Giakm: value.Giakm,
          Hinhanh: data_image,
          Mota: value.Mota,
          Masp: this.item.masp,
        };
        this._api.post('/api/sanpham/update-item', tmp).takeUntil(this.unsubscribe).subscribe(res => {
          alert('Cập nhật thành công');
          this.search();
          this.closeModal();
        });
      });
    }
  }

  onDelete(row) {
    this._api.post('/api/sanpham/delete-item',{Masp:row.Masp}).takeUntil(this.unsubscribe).subscribe(res => {
      alert('Xóa thành công');
      this.search();
    });
  }

  Reset() {
    this.item = null;
    this.formdata = this.fb.group({
      'Tensp': ['', Validators.required],
      'Giatien': ['', Validators.required],
      'Mausac': [''],
    }, {
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
        'Tensp': ['', Validators.required],
        'Giatien': ['', Validators.required],
        'Mausac': [''],
      }, {
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
      this._api.get('/api/sanpham/get-by-id/' + row.masp).takeUntil(this.unsubscribe).subscribe((res: any) => {
        this.item = res;
        debugger;
        this.formdata = this.fb.group({
          'Masp':[row.masp],
          'Hinhanh': [this.item.hinhanh, Validators.required],
          'Tensp': [this.item.tensp],
          'Giatien': [this.item.giatien, Validators.required],
          'Mausac': [this.item.mausac],
        }, {
        });
        this.doneSetupForm = true;
      });
    }, 700);
  }

  closeModal() {
    $('#createItemModal').closest('.modal').modal('hide');
  }
}