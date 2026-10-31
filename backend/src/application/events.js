// Observer: os casos de uso publicam mudanças sem depender do transporte Socket.IO.
let emitter = () => {};
export function setEmitter(fn){emitter=fn;}
export function publish(projectId,event,payload){emitter(projectId,event,payload);}
