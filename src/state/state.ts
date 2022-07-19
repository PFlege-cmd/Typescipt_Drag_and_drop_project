// Abstract state definition

export class State<T>{
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>){
        this.listeners.push(listenerFn);
    }
}

// Listener function

export type Listener<T> = (project: T[]) => void;

