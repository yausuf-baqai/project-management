const header = require('./header')
const container = require('./containerView')
const create = require('./create')
const comments = require('./comments')
const updates = require("./updates")
const { Notification_key, TemplateType } = require("../../../Config/notificationKey");
exports.renderHTML = ({ templateHeader = { title: "", description: [] }, templateBody = [] ,action_url}) => {
  return (`<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Alian - hub</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
        @media screen {
            @font-face {
                font-family: 'Source Sans Pro';
                font-style: normal;
                font-weight: 400;
                src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
            }
            @font-face {
                font-family: 'Source Sans Pro';
                font-style: normal;
                font-weight: 700;
                src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
            }
        }
        .parent-table {
            border-collapse:collapse;
            border-spacing: 0;
            border: 0;
            table-layout:fixed;
            min-width:100%;
            width:100%!important;
            color:#0a0836;
            font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
            font-size:14px;
            line-height:1.5;
            margin:0;
            padding:0;
            background-color: #f6fafb;
        }
        tr {
            padding:0
        }
        .logo {
            max-width:100%;
            outline:none;
            text-decoration:none;
            vertical-align:middle;
            border:none;
            height: 62px;
        }
    </style>
  </head>
  <body>
    <table role="presentation" width="100%" align="left" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;width: 100%; background-color: #F3F6F6; margin: 0;" bgcolor="#F3F6F6">
        <tbody>
          <tr>
            <td class="body__content" align="left" width="100%" valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;color: #000000; font-family: Helvetica,Arial,sans-serif; font-size: 16px; line-height: 20px; padding-bottom: 0px; padding-top: 20px;">
            
              <div style="margin: 0 auto; max-width: 600px; width: 100%; max-width: 640px; background-color: #FFFFFF; border-top-left-radius: 10px; border-top-right-radius: 10px; overflow:hidden;">
              
                  <table role="presentation" border="0" align="center" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tbody><tr>
                      <td width="100%" align="left" valign="top" style="mso-table-lspace:0pt;mso-table-rspace:0pt;padding: 0; background-color: #FFFFFF;" bgcolor="#FFFFFF">
                      
                      <!-- table for top LOGO -->
                        <div style="padding-bottom:0px; background-color: #FFFFFF;">
                          <table width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;table-layout: fixed;">
                            <tbody><tr>
                              <td class="column col-sm-12" width="640" style="mso-table-lspace:0pt;mso-table-rspace:0pt;padding-top: 15px; padding-bottom: 15px;width: 100%; text-align: center;" align="center" valign="top">
                                <a href="#" target="_blank" style="text-size-adjust:100%;-ms-text-size-adjust:100%;-moz-text-size-adjust:100%;-webkit-text-size-adjust:100%;text-decoration:none;text-decoration: none; margin: 0; color: #69CC15;">
                                  <span style="text-size-adjust:100%;-ms-text-size-adjust:100%;-moz-text-size-adjust:100%;-webkit-text-size-adjust:100%;margin: 0; text-decoration: none; color: #253D98;">
                                    <!-- ===== LOGO ===== -->
                                    <img src="https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Falian-hub-logo.png?alt=media&amp;token=2c58a320-585f-4af5-aefa-848c90cd7e6f" alt="Alian ERP; Alian hub" width="200" border="0" style="border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display: block; max-width: 100%; margin: 0 auto; mso-hide: all;">
                                    <!-- ===== LOGO ===== -->
                                  </span>
                                </a>
                              </td>
                            </tr>
                          </tbody></table>
                        </div>
                      <!-- table for top LOGO End -->
                        <!-- Table for Top Title  -->
                        <div style="padding-bottom: 30px;padding-top: 30px; background-color: #F6F7FB;background-image: url('https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2FBanner.png?alt=media&amp;token=9fcabf55-eff5-4160-a3cb-8af59239c341');background-size: 100%;">
                        ${header.headerHTML(templateHeader)}
                        </div>
                           <!-- Table for Top Title End  -->
              
                           <div style="background-color:#fff; max-width:640px;margin: 0 auto">
                           ${templateBody.length > 0 ? templateBody.map(item => {

                            return (`
                         
                                <div style="box-shadow: 0px 1px 8px 0px #0000001A;padding: 30px 20px;">
                                  <table class="px" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;padding:0px 0px 0px 0px;table-layout: fixed;border:1px solid #ececec; border-radius:15px">
                                    <tbody>
                                      <tr>
                                        <td class="column col-sm-12" width="640" style="background-color:#F6F7FB;mso-table-lspace:0pt;mso-table-rspace:0pt;padding:15px;width: 100%; text-align: left;border-radius: 15px 15px 0px 0px;" align="left" valign="top">
                                          ${checkHeaderType(item)}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>
                                          ${checkBodyType(item)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                         `
                            )
                          }).join("") : `<span></span>`}
                            </div>

                           <!-- OPEN TASK section -->
                        
                          <div style="background-color:#fff;max-width:640px;margin:0 auto;border-top:1px solid #ececec;">
                            <table class="px" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;padding:0px 0px 0px 0px;table-layout: fixed;">
                              <tbody>
                                <tr>
                                  <td class="column col-sm-12" max-width="640px" style="background-color:#fff;mso-table-lspace:0pt;mso-table-rspace:0pt;padding:40px 15px;width: 100%; text-align: center;" align="left" valign="top">
                                        <a href="${action_url}" style="text-decoration:none;background-color:#F241CD;color:#fff;border:1px solid #F241CD;padding: 17px 32px;font-size: 18px;line-height: 11px;border-radius: 12px;box-shadow: 0px 8px 30px 0px #F241CD66;
                                        cursor: pointer;" target="_blank">Open Task</a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div style="padding-bottom:0px; background-color: #F0F3FD;margin:0 auto;max-width:640px;">
                            <table width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;table-layout: fixed;">
                              <tbody><tr>
                                <td class="column col-sm-12" width="640" style="mso-table-lspace:0pt;mso-table-rspace:0pt;padding-top: 25px; padding-bottom: 25px;width: 100%; text-align: center;" align="center" valign="top">
                                  <a href="#" target="_blank" style="text-size-adjust:100%;-ms-text-size-adjust:100%;-moz-text-size-adjust:100%;-webkit-text-size-adjust:100%;text-decoration:none;text-decoration: none; margin: 0; color: #69CC15;">
                                    <span style="text-size-adjust:100%;-ms-text-size-adjust:100%;-moz-text-size-adjust:100%;-webkit-text-size-adjust:100%;margin: 0; text-decoration: none;font-size: 16px;line-height: 22.4px; color: #6E7796;">
                                      <!-- ===== LOGO ===== -->
                                      © 2023 Alianhub
                                      <!-- ===== LOGO ===== -->
                                    </span>
                                  </a>
                                </td>
                              </tr>
                            </tbody></table>
                          </div>
                        
                      </td>
                    </tr>
                  </tbody></table>
              <!-- ===== TABLE #3 ===== -->
              
              <!-- ===== TABLE #4 ===== -->
              </div>
            
            
            
            </td>
          </tr>
      </tbody></table>

  </body>
</html>`)

}


function checkHeaderType(data) {
  switch (data.key) {
    case TemplateType.CREATE:
      return header.subHeader({ title: "Create", data })
    case TemplateType.COMMENTS:
      return header.subHeader({ title: "Comments", data })
    case TemplateType.UPDATES:
      return header.subHeader({ title: "Updates", data })
    default:
      return `<div></div>`
  }

}



function checkBodyType(data) {
  switch (data.key) {
    case TemplateType.CREATE:
      return container.containerView(create.createView(data))
    case TemplateType.COMMENTS:
      return container.containerView(comments.createView(data))
    case TemplateType.UPDATES:
      return container.containerView(updates.updatesView(data))
    default:
      return `<div></div>`
  }

}