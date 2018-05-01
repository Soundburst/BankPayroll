import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Bridge} from "../../providers/bridge";
import {Events} from "ionic-angular";
import {HttpErrorResponse} from "@angular/common/http";
import { AlertController } from 'ionic-angular';


/**
 * Generated class for the TestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-payroll',
  templateUrl: 'payroll.html',
})


export class PayrollPage {

  // Instance of the currently selected companies data

  companies = null;
  numComps  = null;

  selectedCompany = null;

  currentCompany = null;
  employees = null;
  payrollHistory = null;


  bridge = null;

  private updateCompany(): void {
    // Reset the previous company data variables
    this.currentCompany = null;
    this.employees = null;
    this.payrollHistory = null;

    // Fetch data for the new company
    this.getCompany( this.selectedCompany );
    this.getEmployees(this.selectedCompany);
    this.getPayrollHistory(this.selectedCompany);
   }


  constructor(public navCtrl: NavController, public navParams: NavParams, bridge: Bridge) {
    this.bridge = bridge;

      bridge.getCompanies().subscribe (
        (comps) => {
          this.numComps = comps.length;
          this.companies = comps;
        }
      )
    }

    private getPayrollHistory(companyId){
      this.bridge.getCompanyPayrollHistory(companyId).subscribe (
         result => {
           this.payrollHistory = result;
         },
        ( err: HttpErrorResponse ) => {
          if( err.status == 401 ) // Login credentials rejected
            console.log("Access denied");
          else // Some other error
            console.log("An error has occurred: " + err.statusText);
        }
      )
    }

    private getCompany(companyId){
      this.bridge.getCompanies().subscribe(
        result => {
          for( let company of result ){
            if( company.uID == companyId ){
              this.currentCompany = company;
              break;
            }
          }
        },
        ( err: HttpErrorResponse ) => {
          if( err.status == 401 ) // Login credentials rejected
            console.log("Access denied");
          else // Some other error
            console.log("An error has occurred: " + err.statusText);
        }
      )
    }

    private getEmployees(companyId){
     this.bridge.getEmployees(companyId).subscribe(
        ( result ) => {
          // Credentials accepted, user has been authenticated
          this.employees = result;
        },
        ( err: HttpErrorResponse ) => {
          if( err.status == 401 ) // Login credentials rejected
            console.log("Access denied");
          else // Some other error
            console.log("An error has occurred: " + err.statusText);
        }
      )
  }

}
