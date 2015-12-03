import {Observable} from '../Observable';
import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {bindCallback} from '../util/bindCallback';

export function skipWhile<T>(predicate: (x: T, index: number) => boolean, thisArg?: any): Observable<T> {
  return this.lift(new SkipWhileOperator(predicate, thisArg));
}

class SkipWhileOperator<T, R> implements Operator<T, R> {
  private predicate: (x: T, index: number) => boolean;

  constructor(predicate: (x: T, index: number) => boolean, thisArg?: any) {
    this.predicate = <(x: T, index: number) => boolean>bindCallback(predicate, thisArg, 2);
  }

  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new SkipWhileSubscriber(subscriber, this.predicate);
  }
}

class SkipWhileSubscriber<T> extends Subscriber<T> {
  private skipping: boolean = true;
  private index: number = 0;

  constructor(destination: Subscriber<T>,
              private predicate: (x: T, index: number) => boolean) {
    super(destination);
  }

  _next(value: T): void {
    const destination = this.destination;
    if (this.skipping === true) {
      const index = this.index++;
      const result = tryCatch(this.predicate)(value, index);
      if (result === errorObject) {
        destination.error(result.e);
      } else {
        this.skipping = Boolean(result);
      }
    }
    if (this.skipping === false) {
      destination.next(value);
    }
  }
}
