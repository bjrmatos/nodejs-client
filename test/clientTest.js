/*globals describe, it, beforeEach, afterEach */

var should = require("should"),
    jsreport = require("jsreport"),
    client = require("../lib/client.js"),
    path = require("path");

describe('testing client', function () {
    var reporter;
    var url = "http://localhost:3000";

    beforeEach(function(done) {
       this.timeout(5000);
       jsreport.bootstrapper({
           rootDirectory: path.join(__dirname, "../"),
           connectionString: { name: "neDB" },
           blobStorage : "fileSystem",
           extensions: ["express", "templates", "html", "phantom-pdf"],
           httpPort: 3000
       }).start().then(function(bootstrapper) {
           reporter = bootstrapper.reporter;
           done();
       }).catch(done);
    });

    afterEach(function() {
        reporter.express.server.close();
    });

    it('should be able to render html',function(done){
        client(url).render({
            template: { content: "hello", recipe: "html"}
        }, function(err, res) {
            should.not.exist(err);
            should.exist(res);

            res.body(function(body) {
                body.toString().should.be.equal("hello");
                done();
            });
        });
    });

    it('should properly handle errors',function(done){
        client(url).render({
            template: { content: "hello{{#each}}", recipe: "html"}
        }, function(err, res) {
            should.exist(err);
            err.message.should.containEql("{{#each}}");
            done();
        });
    });

    it('should work also with / at the end of url',function(done){
        client(url + "/").render({
            template: { content: "hello", recipe: "html"}
        }, function(err, res) {
            should.not.exist(err);
            should.exist(res);

            res.body(function(body) {
                body.toString().should.be.equal("hello");
                done();
            });
        });
    });

    it('should be able to do a complex render with data',function(done){
        client(url + "/").render({
            template: { content: "{{:a}}", recipe: "html", engine: "jsrender"},
            data: { a: "hello"}
        }, function(err, res) {
            should.not.exist(err);
            should.exist(res);

            res.body(function(body) {
                body.toString().should.be.equal("hello");
                done();
            });
        });
    });
});

describe('testing client without connection', function () {
    it('should be able to render html',function(done){
        client("http://localhost:9849").render({
            template: { content: "hello", recipe: "html"}
        }, function(err, res) {
            should.exist(err);
            done();
        });
    });
});

