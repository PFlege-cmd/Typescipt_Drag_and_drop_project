namespace App {
    export interface Draggable{
        dragStartHandler(event: DragEvent): void;
        dragEndHandler(event: DragEvent): void;
    }

    export interface Droppable{
        dragDropHandler(event: DragEvent): void;
        dragOverHandler(event: DragEvent): void;
        dragAndLeaveHandler(event: DragEvent): void;
    }

}
