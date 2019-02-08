import React from 'react'
import { generateShareIcon, ShareButtons as _ShareButtons, ShareCounts } from 'react-share'

class ShareButtons extends React.Component<any, any> {
    render() {

        const { FacebookShareButton } = _ShareButtons
        const { FacebookShareCount } = ShareCounts
        return (
            <div>
                <FacebookShareButton url='' beforeOnClick={this.handle}>
                    <FacebookShareCount url='' />
                    {generateShareIcon('facebook')}
                </FacebookShareButton>
            </div>
        )
    }

    handle(): number {
        return 12
    }
}
