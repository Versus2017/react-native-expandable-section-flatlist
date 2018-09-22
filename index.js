/*
 * https://github.com/facebook/react-native
 * Copyright cuiyueshuai
 * @author cuiyueshuai<850705402@qq.com>
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  LayoutAnimation,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

class ExpandableList extends Component {
  constructor(props) {
    super(props);
    this.flatList;
    this.layoutStore = [];
    let map = new Map();
    if (props.dataSource && props.isOpen) {
      props.dataSource.map((item, i) => map.set(i, true))
    }
    if (props.openOptions) {
      props.openOptions.map((item) => map.set(item, true))
    }
    this.state = {
      memberOpened: map
    }
  }

  static propTypes = {
    dataSource: PropTypes.array.isRequired,
    headerKey: PropTypes.string,
    memberKey: PropTypes.string,
    renderRow: PropTypes.func,
    renderSectionHeaderX: PropTypes.func,
    renderSectionFooterX: PropTypes.func,
    headerOnPress: PropTypes.func,
    isOpen: PropTypes.bool,
    openOptions: PropTypes.array,
    rowNumberCloseMode: PropTypes.number,
    onHeaderAction: PropTypes.bool,
    onViewableItemsChanged: PropTypes.func,
  };

  static defaultProps = {
    headerKey: 'header',
    memberKey: 'member',
    isOpen: false,
    rowNumberCloseMode: 0,
    onHeaderAction: true,
  };

  _keyExtractor = (item, index) => index;
  scrollToEnd = (params) => this.flatList.scrollToEnd(params);
  scrollToIndex = (params) => this.flatList.scrollToIndex(params);
  scrollToItem = (params) => this.flatList.scrollToItem(params);
  scrollToOffset = (params) => this.flatList.scrollToOffset(params);
  recordInteraction = (params) => this.flatList.recordInteraction();
  flashScrollIndicators = (params) => this.flatList.flashScrollIndicators();

  scrollToSection = ({ animated, section }) => {
    let offset = 0;
    this.layoutStore.forEach((item, index) => {
      if (index < section) {
        offset = offset + item.layout.height
      }
    });
    this.flatList.scrollToOffset({ animated, offset });
  };

  setSectionState = (index, state) => {
    this.setState((s) => {
      const memberOpened = new Map(s.memberOpened);
      memberOpened.set(index, state); // toggle
      return {memberOpened};
    });
    LayoutAnimation.easeInEaseOut();
  }

  _onPress = (i) => {
    const { onHeaderAction } = this.props;
    onHeaderAction && this.openMember(i)

    if (this.props.headerOnPress) {
      this.props.headerOnPress(i, !(!!this.state.memberOpened.get(i)));
    }
  };

  openMember (index) {
    this.setState((state) => {
      const memberOpened = new Map(state.memberOpened);
      memberOpened.set(index, !memberOpened.get(index)); // toggle
      return { memberOpened };
    });
    LayoutAnimation.easeInEaseOut();
  }

  _itemLayout = (e) => {
    const target = e.nativeEvent.target;
    if (this.layoutStore.filter(item => item.target === target)[0]) {
      this.layoutStore = this.layoutStore.map((item, index) => {
        if (item.target === target) return e.nativeEvent;
        return item;
      });
    } else {
      this.layoutStore.push(e.nativeEvent);
      this.layoutStore.length === this.props.dataSource.length &&
      this.layoutStore.sort((v1, v2) => v1.target - v2.target);
    }
  };

  _renderItem = ({ item, index }) => { // eslint-disable-line
    const { renderRow, renderSectionHeaderX, renderSectionFooterX, headerKey,
      memberKey, rowNumberCloseMode } = this.props;
    const sectionId = index;
    let memberArr = item[memberKey] || [];
    if (!this.state.memberOpened.get(sectionId) && memberArr.length > rowNumberCloseMode) {
      memberArr = memberArr.slice(0, rowNumberCloseMode);
    }

    return (
      <View onLayout={this._itemLayout}>
        <TouchableWithoutFeedback onPress={() => this._onPress(sectionId)}>
          { renderSectionHeaderX ? renderSectionHeaderX(item[headerKey], sectionId,
              !!this.state.memberOpened.get(sectionId)) : null}
        </TouchableWithoutFeedback>
        <ScrollView scrollEnabled={false}>
          {
            memberArr.map((rowItem, rowId) => {
              return (
                <View key={rowId}>
                  {renderRow ? renderRow(rowItem, rowId, index) : null}
                </View>
              );
            })
          }
        </ScrollView>
        { renderSectionFooterX ? renderSectionFooterX(item, sectionId) : null }
      </View>
    );
  };

  _getItemLayout = (data, index) => {
    let offset = 0;
    this.layoutStore.forEach(item => offset = offset + item.layout.height);
    this.props.getItemLayout && this.props.getItemLayout(data, index);
    return { length: offset / index, offset: offset, index };
  };

  _onViewableItemsChanged = ({ viewableItems, changed }) => {
    this.props.onViewableItemsChanged && this.props.onViewableItemsChanged(viewableItems, changed)
  }

  render() {
    const { dataSource } = this.props;
    return (
      <FlatList
        keyExtractor={this._keyExtractor}
        extraData={this.state}
        initialNumToRender={dataSource.length || 0}
        {...this.props}
        ref={instance => this.flatList = instance}
        onViewableItemsChanged={this._onViewableItemsChanged}
        getItemLayout={this._getItemLayout}
        data={dataSource}
        horizontal={false}
        renderItem={this._renderItem}
      />
    );
  }
}

export default ExpandableList;
