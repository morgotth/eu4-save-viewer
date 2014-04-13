define(function() {
    var Test = {
        quiet: true,
        fail: function (actual, expected, message) {
            console.error(message !== undefined ? message : "Error: expected '"+expected+"' but actual is '"+actual+"'");
        },
        assertEquals: function(actual, expected, message) {
            if(actual !== expected) {
                Test.fail(actual, expected, message);
            } else if(!Test.quiet) {
                console.log("Valid " + expected);
            }
        },
        assertSimilar: function (actual, expected, message) {
            if(actual === undefined || actual === null
                || actual.toString() !== expected.toString()) {
                Test.fail(actual, expected, message);
            } else if(!Test.quiet) {
                console.log("Valid " + expected);
            }
        }
    };

    return Test;
});
