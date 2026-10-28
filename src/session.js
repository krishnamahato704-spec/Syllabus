export class SessionGate {
  constructor() { this.generation = 0; this.uid = null; this.phase = 'checking'; }
  activate(uid) {
    this.generation++; this.uid = uid || null; this.phase = uid ? 'loading' : 'signedout';
    return this.capture();
  }
  capture() { return Object.freeze({ uid: this.uid, generation: this.generation }); }
  isCurrent(token) { return !!token && token.uid === this.uid && token.generation === this.generation; }
  setPhase(token, phase) { if (this.isCurrent(token)) this.phase = phase; }
  assertWritable(token) {
    if (!this.isCurrent(token) || !token.uid) throw new Error('The account session changed. Start again in the current account.');
    if (this.phase !== 'ready') throw new Error('Cloud sync is not ready. Wait for loading or reconnect before saving.');
  }
}
