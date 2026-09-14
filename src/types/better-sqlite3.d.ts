declare module "better-sqlite3" {
  export interface Statement {
    get(...params: any[]): any;
    all(...params: any[]): any[];
    run(...params: any[]): any;
  }

  export interface Transaction {
    (fn?: any): any;
  }

  export interface Database {
    pragma(command: string): any;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    transaction(fn: () => any): Transaction;
  }

  export default class DatabaseImpl implements Database {
    constructor(filename: string);
    pragma(command: string): any;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    transaction(fn: () => any): Transaction;
  }
}

