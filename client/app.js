$(function () {
  $("form").on("submit", function (e) {
    e.preventDefault();
    let $form = $(this);
    let url = $form.attr("action");
    var formData = new FormData($form[0]);
    $.ajax({
      method: "POST",
      url: url,
      data: formData,
      processData: false,
      contentType: false,
      enctype: "multipart/form-data",
      dataType: "text",
      success: function (data) {
        console.log("success", data);
        $form.append(data);
      },
      error: function (err) {
        console.log(err);
      },
    });
  });

  $("#download").click(function (e) {
    $.ajax({
      method: "GET",
      url: "/download",
      success: function (data) {
        window.open("/download", "_blank");
      },
      error: function (err) {
        console.log(err);
      },
    });
  });
});
