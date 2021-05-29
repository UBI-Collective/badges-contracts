// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract Badge is ERC721URIStorage, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    struct Badge {
        uint256 numClonesAllowed;
        uint256 numClonesInWild;
        uint256 cloneFromId;
    }

    event BadgeMinted(
        uint256 tokenId,
        uint256 numClonesAllowed,
        uint256 numClonesInWild,
        string tokenUri,
        address owner
    );

    event BadgeCloned(
        uint256 clonedTokenId,
        uint256 cloneFromId,
        string tokenUri,
        address owner
    );

    event OriginalBadgeUpdated(
        uint256 originalTokenId,
        uint256 numClonesInWild
    );

    Badge[] public badges;
    bool public isMintable = true;

    modifier mintable {
        require(
            isMintable == true,
            "New badge are no longer mintable on this contract."
        );
        _;
    }

    constructor () public ERC721("FightPandemics.com Badges", "FPB") {
        // If the array is new, skip over the first index.
        if (badges.length == 0) {
            Badge memory _dummyBadge = Badge({
                numClonesAllowed: 0,
                numClonesInWild: 0,
                cloneFromId: 0
            });
            badges.push(_dummyBadge);
        }
    }

    function mint(
        address _to,
        uint256 _numClonesAllowed,
        string memory _tokenUri
    ) public mintable onlyOwner returns (uint256 tokenId) {
        Badge memory _badge = Badge({
            numClonesAllowed: _numClonesAllowed,
            numClonesInWild: 0,
            cloneFromId: 0
        });

        _tokenIds.increment();
        tokenId = _tokenIds.current();

        badges.push(_badge);
        badges[tokenId].cloneFromId = tokenId;

        _safeMint(_to, tokenId);
        setTokenURI(tokenId, _tokenUri);

        emit BadgeMinted(tokenId,
            badges[tokenId].numClonesAllowed,
            badges[tokenId].numClonesInWild,
            _tokenUri,
            _to
        );
    }

    function clone(
        address _to,
        uint256 _originalTokenId,
        uint256 _numClonesRequested
    ) public
    mintable
    onlyOwner {
        Badge memory _badge = badges[_originalTokenId];
        require(_badge.numClonesInWild + _numClonesRequested <= _badge.numClonesAllowed,
            "No. of clones requested exceed no. of clones allowed"
        );

        _badge.numClonesInWild += _numClonesRequested;
        badges[_originalTokenId] = _badge;
        emit OriginalBadgeUpdated(_originalTokenId, _badge.numClonesInWild);

        for (uint i = 0; i < _numClonesRequested; i++) {
            Badge memory _clonedBadge;
            _clonedBadge.numClonesAllowed = 0;
            _clonedBadge.numClonesInWild = 0;
            _clonedBadge.cloneFromId = _originalTokenId;

            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            badges.push(_clonedBadge);

            _safeMint(_to, newTokenId);

            string memory  _tokenUri = tokenURI(_originalTokenId);
            setTokenURI(newTokenId, _tokenUri);

            emit BadgeCloned(newTokenId,
                _clonedBadge.cloneFromId,
                _tokenUri,
                _to
            );
        }
    }

    function setTokenURI(uint256 _tokenId, string memory _tokenURI)
        public
        onlyOwner
    {
        _setTokenURI(_tokenId, _tokenURI);
    }
    
    function getBadgeById(uint256 _tokenId)
        public
        view
        returns (uint256 numClonesAllowed,
            uint256 numClonesInWild,
            uint256 cloneFromId,
            string memory tokenUriInfo
        )
    {
        Badge memory _badge = badges[_tokenId];
        numClonesAllowed = _badge.numClonesAllowed;
        numClonesInWild = _badge.numClonesInWild;
        cloneFromId = _badge.cloneFromId;
        tokenUriInfo = tokenURI(_tokenId);
    }

    function getLatestBadgeId() public view returns (uint256 tokenId) {
        if (badges.length == 0) {
            tokenId = 0;
        } else {
            tokenId = badges.length - 1;
        }
    }

    function setMintable(bool _isMintable) public onlyOwner {
        isMintable = _isMintable;
    }

}
