import twigSitewideNotice from "./sitewide-notice.twig";


export default {
    title: "Stories/Sitewide Notice",
    component: "sitewide-notice",
    tags: ['autodocs'],
};


const Template = ( { display_sitewide_notice, sitewide_notice_text }) =>
    twigSitewideNotice({
		display_sitewide_notice,
		sitewide_notice_text
    });

export const Default = Template.bind({});
Default.args = {
	display_sitewide_notice: true,
	sitewide_notice_text: "<p>This is a <a href='#'>sitewide notice</a></p>",
};
