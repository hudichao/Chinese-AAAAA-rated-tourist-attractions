/*
* @Author: hudichao
* @Date:   2017-01-28 01:05:52
* @Last Modified by:   hudichao
* @Last Modified time: 2017-02-06 15:59:24
*/

'use strict';
var jsdom = require('jsdom');
var $ = require('jquery')(jsdom.jsdom().defaultView);
var fs = require('fs');
var http = require('http');

var host = 'www.cnta.gov.cn';
var base = '/was5/web/';
var search = 'search?channelid=242887';

var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36';
var outputFileName = './output.json';

function getData() {
    var result = [];

    getDataOfThisPage(search);

    function getDataOfThisPage(pageUrl) {
        console.log('获取数据!');
        var options = {
            host: host,
            path: base + pageUrl,
            headers: {
                'user-agent': ua
            },
            timeout: 5000
        };
        var html = '';
        http
        .get(options, res => {
            res.setEncoding('utf8');
            res.on('data', data => {
                html += data;
            });
            res.on('end', () => {
                var lists = $(html).find('.main1_right_m');
                lists.each((i, dom) => {
                    var item = {
                        name: $(dom).find('.main1_right_m1 a').text(),
                        place: $($(dom).find('.main1_right_m2')[0]).text(),
                        rank: $($(dom).find('.main1_right_m2')[1]).text(),
                        year: $(dom).find('.main1_right_m3').text()
                    };
                    result.push(item);
                });
                console.log(result.length);

                var nextPageUrl = $(html).find('.next-page').attr('href');
                if (nextPageUrl) {
                    console.log('获取下一页信息');
                    setTimeout(() => {
                        getDataOfThisPage(nextPageUrl);
                    }, 2000);
                    
                } else {
                    console.log('finished');
                    saveToFile(result);
                }
            });
        })
        .on('error', e => {
            console.log(e.message);
            getDataOfThisPage(pageUrl);
        })
    }
    function saveToFile(data) {
        // console.log(data);
        fs.writeFile(outputFileName, 
            JSON.stringify(data, null, 4),
        err => {
            if (err) {
                console.log(err);
            }
        })
    }
}

getData();

