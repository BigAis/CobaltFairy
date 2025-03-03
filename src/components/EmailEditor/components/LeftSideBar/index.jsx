import { useState, useContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from '../../utils/classNames'

import { faColumns, faMinusSquare, faHeading, faFont, faGripLines, faImages, faCubes, faImage, faShareAltSquare } from '@fortawesome/free-solid-svg-icons'
import { GlobalContext } from '../../reducers'
import { Input, Spin } from 'antd'
import { deepClone } from '../../utils/helpers'
import useTranslation from '../../translation'
import useDataSource from '../../configs/useDataSource'

const LeftSideBar = (props) => {
	const { clearStyles } = props
	const { setCurrentItem, setIsDragStart, blockList, setActionType } = useContext(GlobalContext)
	const [currentSideBarKey, setCurrentSideBarKey] = useState('blocks')
	const { t } = useTranslation()
	const { blockConfigsList } = useDataSource()

	const sidebarTabsList = [
		{
			name: t('blocks'),
			icon: faCubes,
			key: 'blocks',
		},
		// {
		//   name: t("photos"),
		//   icon: faImages,
		//   key: "photos",
		// },
	]
	const [photos, setPhotos] = useState({
		list: null,
		pagination: 1,
		query: '',
		isLoading: true,
		scrollLoading: false,
	})

	const icons = {
		column: faColumns,
		text: faFont,
		heading: faHeading,
		button: faMinusSquare,
		divider: faGripLines,
		image: faImage,
		social_link: faShareAltSquare,
		about_the_book: faImage,
	}

	const dragEnd = (event) => {
		event.target.style.border = ''
		event.target.children[0] && event.target.children[0].classList.remove('sidebar-block-move')
		setTimeout(() => {
			setIsDragStart(false)
			clearStyles()
		}, 50)
	}

	const dragStart = (item) => (event) => {
		setCurrentItem({ data: deepClone(item), type: 'add', index: blockList.length + 1 })
		setIsDragStart(true)
		event.target.style.border = '1px dashed #ccc'
		event.target.children[0] && event.target.children[0].classList.add('sidebar-block-move')
		setActionType('add')
	}

	const blocksElement = () => {
		return (
			<motion.div className="side-bar-blocks" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }} key="blocks">
				<div className="side-bar-blocks-container">
					{blockConfigsList.map((item,i) => {
						if (item.isDivider) return <h4 className="itemiblock-list-title">{item.name}</h4>
						// if(item.key=="about_the_book") item.key='hero';
						return (
							<div className="side-bar-blocks-item" data-block_type="header" draggable="true" key={item.key+'_'+i} onDragEnd={dragEnd} onDragStart={dragStart(item)}>
								<div className="sidebar-block">
									{/* <FontAwesomeIcon icon={icons[item.key]} className="sidebar-block-icon" /> */}
									{item.key == 'column' ? (
										<>
											<img src={`/images/editor-icons/${item.columnType}.png`} />
										</>
									) : (
										<>
											<img src={`/images/editor-icons/${item.key}.png`} />
										</>
									)}
									<div className="sidebar-block-text">{item.name}</div>
								</div>
							</div>
						)
					})}
				</div>
			</motion.div>
		)
	}

	return (
		<div className="side-bar">
			{/* <div className="side-bar-tabs">
        {sidebarTabsList.map((item) => {
          const { key, icon, name } = item;
          return (
            <div
              onClick={() => {
                if (key !== currentSideBarKey) {
                  setCurrentSideBarKey(key);
                  setPhotos({ list: null, pagination: 1, isLoading: true, scrollLoading: false, query: "" });
                }
              }}
              className={classNames(currentSideBarKey === key ? "side-bar-tab-item-active" : "side-bar-tab-item", "side-bar-item-default")}
              key={key}
            >
              <FontAwesomeIcon icon={icon} className="text-18" />
              <div className="side-bar-icon-title">{name}</div>
            </div>
          );
        })}
      </div> */}
			<div className="side-bar-content">
				<AnimatePresence mode="wait">{blocksElement()}</AnimatePresence>
			</div>
		</div>
	)
}

export default LeftSideBar
