
export const differentiatorTemplate = {
    top_layout: null,
    top_text: null,
    top_superscript: null,
    top_icon: null,
    top_image: null,
    title: null,
    text: null,
    link: null
}

export const differentiatorText = {
    ...differentiatorTemplate,
    top_layout: 'text',
    top_text: '1',
    top_superscript: 'St',
    title: 'Place in Awesome',
    text: 'Innovative, creative, and engaging. The program is designed for students who are interested in pursuing a career in technology.',
    link: {
        title: 'Bellevue College',
        url: '#',
    }
}

export const differentiatorIcon = {
    ...differentiatorTemplate,
    top_layout: 'icon',
    top_icon: '<i class="fas fa-graduation-cap" aria-hidden="true"></i>',
    title: 'Graduate with a Degree',
    text: 'Innovative, creative, and engaging. The program is designed for students who are interested in pursuing a career in technology.',
    link: {
        title: 'Bellevue College',
        url: '#',
    }
}

export const differentiatorImage = {
    ...differentiatorTemplate,
    top_layout: 'image',
    top_image: '<img src="https://picsum.photos/id/55/580/322" alt="Placeholder Image">',
    title: 'Cool Image',
    text: 'We found this cool image!',
    link: {
        title: 'Bellevue College',
        url: '#',
    }
}