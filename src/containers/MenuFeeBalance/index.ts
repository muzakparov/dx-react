import { connect } from 'react-redux'

import MenuFeeBalance from 'components/MenuFeeBalance'

import { State } from 'types'

const mapState = ({ blockchain: { currentAccount, feeRatio, mgnSupply } }: State) => ({
  feeRatio,
  mgnSupply,
  showFeeRatio: currentAccount && mgnSupply && typeof feeRatio === 'number',
})

export default connect(mapState)(MenuFeeBalance)
