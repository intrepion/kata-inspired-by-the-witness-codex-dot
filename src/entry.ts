if (new URLSearchParams(location.search).has("atlas")) {
  void import("./main");
} else {
  void import("./walk");
}
