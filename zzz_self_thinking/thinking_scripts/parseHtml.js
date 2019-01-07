/**
    <xhtml:html xmlns:xhtml="http://www.w3.org/1999/xhtml">
        <xhtml:head>
            <xhtml:title>Example XHTML page</xhtml:title>
        </xhtml:head>
        <xhtml:body>
            Hello world!
        </xhtml:body>
    </xhtml:html>
*/

const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')'  //  ((?:[a-zA-Z_][\\w\\-\\.]*\\:)?[a-zA-Z_][\\w\\-\\.]*) name:wangzhen wangzhen e
const startTagOpen = new RegExp('^<' + qnameCapture)  // <Name:wangzhen > <Naame:wangzhen />
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>') // < Name:wangzhen > , </Name:wangzhen>
const doctype = /^<!DOCTYPE [^>]+>/i
const comment = /^<!--/
const conditionalComment = /^<!\[/