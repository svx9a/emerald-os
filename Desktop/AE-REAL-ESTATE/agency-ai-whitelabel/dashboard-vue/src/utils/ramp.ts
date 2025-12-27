export default function(scheme: any[]) {
  return function(t: number) {
    var n = scheme.length;
    var i = Math.max(0, Math.min(n - 1, Math.floor(t * n)));
    return scheme[i];
  };
}
