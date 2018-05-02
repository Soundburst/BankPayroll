import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Bridge, PayrollEntry, PayrollHistory} from "../../providers/bridge";
import {Events} from "ionic-angular";
import {HttpErrorResponse} from "@angular/common/http";
import { AlertController } from 'ionic-angular';

import * as moment from "moment";
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
  payrollHistory: Array<PayrollHistory>;
  lastPayStart = null;

  // Model for current payroll data entered into the form
  payrollData = {};

  bridge = null;

  private updateCompany(): void {
    // Reset the previous company data variables
    this.currentCompany = null;
    this.employees = null;
    this.payrollHistory = null;
    this.payrollData = {};

    // Fetch data for the new company
    this.getCompany( this.selectedCompany );
    this.getEmployees(this.selectedCompany);
    this.getPayrollHistory(this.selectedCompany);
    this.getLastPayrollSubmission();
   }

   private getLastPayrollSubmission(){
     let ccID = this.currentCompany.uID;
     let lastpaystart = this.lastPayStart.format("MM/DD/YYYY")
     if( this.payrollHistory != null ) {
       for (let history of this.payrollHistory) {
         if (ccID == history.companyId && lastpaystart == history.payPeriodStart) {
         console.log("POOOP" + history.payroll);
           this.flattenPayroll(history.payroll);
           break;
         }
       }
     }
   }

   private flattenPayroll(payrollData){
     let payroll = {};
     for(let entry of payrollData){
       let id = entry.employeeId;
       let hours = entry.hours;
       payroll[id] = hours;
     }
     this.payrollData = payroll;
   }

   private submitShit(){

   }

   private getLastPayPeriod(){
     let currentStart = moment(this.currentCompany.payPeriodStart, "MM/DD/YYYY");

     let lastStart  = null;
     let payType = this.currentCompany.payInterval;


     if(payType == "WEEKLY"){
         lastStart = currentStart.subtract(7, 'days');
     } else if(payType == "BIWEEKLY"){
         lastStart = currentStart.subtract(14, 'days');
     } else if(payType == "BIMONTHLY"){
         let dayStart = currentStart.format('D');
         //16 - 15
         if(dayStart == '16') lastStart = currentStart.subtract(15, 'days');
         //1 -> 16

         if(dayStart == '1') lastStart = currentStart.subtract(1, 'month').add(15, 'days');
     }

     return lastStart;
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
              this.lastPayStart = this.getLastPayPeriod();
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

    private getEmployees(companyId) {
      this.bridge.getEmployees(companyId).subscribe(
        (result) => {
          // Credentials accepted, user has been authenticated
          this.employees = result;
        },
        (err: HttpErrorResponse) => {
          if (err.status == 401) // Login credentials rejected
            console.log("Access denied");
          else // Some other error
            console.log("An error has occurred: " + err.statusText);
        }
      )
    }

      private submitPayroll( companyId: string , payrollStart: string, payroll: Array<PayrollEntry> ){
        this.bridge.submitCompanyPayroll(payrollStart, companyId, payroll).subscribe(
          result => {
            console.log("Payroll Submitted")
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
