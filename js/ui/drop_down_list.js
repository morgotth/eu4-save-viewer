define(["jquery"], function($) {
    function click_handler() {
        var list = $(this).next("ul");
        if(list.hasClass("drop-down-list-hidden")) {
            list.removeClass("drop-down-list-hidden");
        } else {
            list.addClass("drop-down-list-hidden");
        }
    }

    function drop_down_list(root_element) {
        console.log("Enable drop down list behavior");
        var parent = (root_element || '.drop-down-list-root');

        $(parent+" ul", root_element).prev().addClass("drop-down-list");

        $(".drop-down-list", root_element).each(function() {
            $(this).on("click", click_handler).next("ul").each(function() {
                console.log("Add drop-down-list-hidden into "+$(this).attr("id"))
                $(this).addClass("drop-down-list-hidden");
            });
        });
    }

    return drop_down_list;
});