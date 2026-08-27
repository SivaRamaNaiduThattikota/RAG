// Module 10, Concept 08 -- Python integration with python-oracledb.
// "The Bind Type Trap" lab. Two independent toggle groups (bind value type,
// client path) drive one shared render() that decides among three real
// outcomes, each traceable to a specific section of python-oracledb's own
// "Using VECTOR Data" documentation: works directly, needs an input type
// handler, or must be sent as a string instead.

(function () {
  "use strict";

  var bindButtons_1008 = [
    document.getElementById("bindTypeArray_1008"),
    document.getElementById("bindTypeNumpy_1008"),
    document.getElementById("bindTypeString_1008"),
  ];
  var clientButtons_1008 = [
    document.getElementById("clientThin_1008"),
    document.getElementById("clientThickOld_1008"),
  ];
  var bindCodeEl_1008 = document.getElementById("bindTypeCode_1008");
  var clientCodeEl_1008 = document.getElementById("clientPathCode_1008");
  var outcomeEl_1008 = document.getElementById("bindOutcome_1008");
  var verdictEl_1008 = document.getElementById("bindVerdict_1008");

  if (!bindCodeEl_1008 || !clientCodeEl_1008 || !outcomeEl_1008 || !verdictEl_1008) return;
  if (bindButtons_1008.some(function (b) { return !b; })) return;
  if (clientButtons_1008.some(function (b) { return !b; })) return;

  var BIND_CODE_1008 = {
    array: 'vector_data = array.array("f", [0.6, 0.8, 0.0])\ncursor.execute(\n  "insert into embeddings (chunk_id, embedding) values (:1, :2)",\n  ["chk_9f21_2_03", vector_data]\n)',
    numpy: 'vector_data = numpy.array([0.6, 0.8, 0.0], dtype=numpy.float32)\nconnection.inputtypehandler = input_type_handler  # registers numpy_converter_in\ncursor.execute(\n  "insert into embeddings (chunk_id, embedding) values (:1, :2)",\n  ["chk_9f21_2_03", vector_data]\n)',
    string: 'vector_data = "[0.6, 0.8, 0.0]"\ncursor.execute(\n  "insert into embeddings (chunk_id, embedding) values (:1, :2)",\n  ["chk_9f21_2_03", vector_data]\n)',
  };
  var CLIENT_CODE_1008 = {
    thin: "# python-oracledb Thin mode -- the default, no Oracle Client libraries installed\nconnection = oracledb.connect(user=user, password=pwd, dsn=dsn)",
    "thick-old": "# python-oracledb Thick mode, initialized against Oracle Client 21c or earlier\noracledb.init_oracle_client()\nconnection = oracledb.connect(user=user, password=pwd, dsn=dsn)",
  };

  function activeValue_1008(buttons, dataKey) {
    var active = buttons.find(function (b) { return b.classList.contains("active"); });
    return active ? active.dataset[dataKey] : buttons[0].dataset[dataKey];
  }

  function setActive_1008(buttons, target) {
    buttons.forEach(function (b) {
      var isTarget = b === target;
      b.classList.toggle("active", isTarget);
      b.classList.toggle("secondary", !isTarget);
    });
  }

  function render() {
    var bind = activeValue_1008(bindButtons_1008, "bind");
    var client = activeValue_1008(clientButtons_1008, "client");

    bindCodeEl_1008.textContent = BIND_CODE_1008[bind];
    clientCodeEl_1008.textContent = CLIENT_CODE_1008[client];

    outcomeEl_1008.classList.remove("hot");
    verdictEl_1008.classList.remove("warning");

    if (bind === "array" && client === "thin") {
      outcomeEl_1008.classList.add("hot");
      outcomeEl_1008.textContent = "INSERT WORKS DIRECTLY";
      verdictEl_1008.textContent =
        'Per python-oracledb\'s own "Using VECTOR Data" guide, Section 15.1.1: "vector data can be inserted using Python array.array() objects" -- this is the documented Thin-mode bind type, no conversion needed.';
    } else if (bind === "numpy" && client === "thin") {
      outcomeEl_1008.classList.add("hot");
      outcomeEl_1008.textContent = "NEEDS AN INPUT TYPE HANDLER";
      verdictEl_1008.textContent =
        'Per Section 15.6.1: "you must convert NumPy ndarray types to array types" -- an input type handler (numpy_converter_in, registered on connection.inputtypehandler) does this conversion before the bind reaches the database. Without it, the ndarray is not a documented bind type.';
    } else if (bind === "string" && client === "thin") {
      outcomeEl_1008.textContent = "NOT THE DOCUMENTED THIN-MODE PATH";
      verdictEl_1008.classList.add("warning");
      verdictEl_1008.textContent =
        "The string form is documented in Section 15.5.1 for Thick mode with Oracle Client 21c or earlier specifically -- it is not the bind type Section 15.1.1 documents for Thin mode. Use array.array instead.";
    } else if (client === "thick-old" && (bind === "array" || bind === "numpy")) {
      outcomeEl_1008.textContent = "MUST USE A STRING INSTEAD";
      verdictEl_1008.classList.add("warning");
      verdictEl_1008.textContent =
        'Per Section 15.5.1, on Thick mode with Oracle Client 21c or earlier: "you must use strings when inserting vectors." array.array (and, by the same constraint, a numpy array converted to array.array) is not the accepted bind type on this older client path.';
    } else {
      outcomeEl_1008.classList.add("hot");
      outcomeEl_1008.textContent = "INSERT WORKS (THE OLDER-CLIENT WORKAROUND)";
      verdictEl_1008.textContent =
        'Per Section 15.5.1, this is the documented workaround for Thick mode with Oracle Client 21c or earlier -- vectors are inserted as strings and fetched back as Python lists, not array.array().';
    }
  }

  bindButtons_1008.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setActive_1008(bindButtons_1008, btn);
      render();
    });
  });
  clientButtons_1008.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setActive_1008(clientButtons_1008, btn);
      render();
    });
  });

  render();
})();
